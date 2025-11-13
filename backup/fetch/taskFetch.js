import { deleteObject } from "firebase/storage";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { queueImageUpload } from "../utils/imageUploadQueue";

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: async (task) => {
      await deleteTask(task);
    },
    onSuccess: () => {
      toast.success("Task deleted successfully", { autoClose: 1500 });
    },
    onError: (error) => {
      toast.error("Error deleting task: " + error.message);
    },
  });
};

export const deleteTask = async (task) => {
  // Remove Firestore document
  await deleteDoc(doc(db, "tasks", task.id));
  // Remove image from storage if photoUrl exists
  if (task.photoUrl) {
    try {
      const storage = getStorage();
      // Extract the storage path from the photoUrl
      const url = new URL(task.photoUrl);
      // Firebase Storage URLs are like: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/tasks%2F<filename>?...
      // We need to get the path after '/o/' and decode it
      const pathMatch = url.pathname.match(/\/o\/(.*)$/);
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const photoRef = ref(storage, filePath);
        await deleteObject(photoRef);
      }
    } catch (err) {
      console.error("Error deleting image from storage:", err);
    }
  }
};

export const addTask = async (task) => {
  let photoUrl = "";
  if (task.photoFile) {
    const storage = getStorage();
    const ext = task.photoFile.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    const photoRef = ref(storage, `tasks/${uniqueName}`);
    await uploadBytes(photoRef, task.photoFile);
    photoUrl = await getDownloadURL(photoRef);
  }
  const taskData = { ...task, photoUrl };
  delete taskData.photoFile; // Remove photoFile before saving to Firestore
  await addDoc(collection(db, "tasks"), taskData);
};

export const useAddTask = () => {
  return useMutation({
    mutationFn: async ({ task }) => {
      // Remove photoFile from task object
      await addTask(task);
    },
    onSuccess: () => {
      toast.success("Task added successfully", { autoClose: 1500 });
    },
    onError: (error) => {
      toast.error("Error adding task: " + error.message);
    },
  });
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: () => [], // Initial empty array
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: false, // We'll update manually
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tasks"),
      (querySnapshot) => {
        const tasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Firestore snapshot tasks:", tasks); // Add this line
        queryClient.setQueryData(["tasks"], tasks);
        toast.success("Tasks have been retrieved", { autoClose: 1500 });
      },
      (error) => {
        toast.error("Failed to retrieve tasks: " + error.message);
      }
    );
    return () => unsubscribe();
  }, [queryClient]);

  return query;
};