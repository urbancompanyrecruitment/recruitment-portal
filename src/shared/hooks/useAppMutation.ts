import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

export const useAppMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  successMessage?: string,
) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation<TResult, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (successMessage) message.success(successMessage);
    },
    onError: error => {
      message.error(error.message);
    },
  });
};
