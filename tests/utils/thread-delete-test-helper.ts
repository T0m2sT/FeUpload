import { Alert } from 'react-native';
import { deleteThread } from '@/services/threads';
import { useRouter } from 'expo-router';
import { useState } from 'react';

// This is a minimal mock for testing the logic in isolation if needed
export const useDeleteThreadLogic = (threadId: string) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Publicação',
      'Tens a certeza que queres eliminar esta publicação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            if (isDeleting) return;
            setIsDeleting(true);
            try {
              await deleteThread(threadId);
              router.back();
            } catch (err: any) {
              setIsDeleting(false);
              Alert.alert('Erro', 'Não foi possível eliminar a publicação.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  return { handleDelete, isDeleting };
};
