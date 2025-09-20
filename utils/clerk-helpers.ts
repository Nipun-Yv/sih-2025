import { UserMetadata } from "@/types/User";
export async function updateUserMetadata(
    userId: string, 
    metadata: Partial<UserMetadata>
  ) {
    try {
      const response = await fetch('/api/users/update-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, metadata }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
  }
  