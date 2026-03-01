import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async (queryKey, updateFn, mutationFn) => {
      // Snapshot previous data
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update UI
      queryClient.setQueryData(queryKey, (old) => updateFn(old));

      try {
        // Execute mutation
        const result = await mutationFn();
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey });
        return result;
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData(queryKey, previousData);
        throw error;
      }
    },
    [queryClient]
  );

  return { optimisticUpdate };
}