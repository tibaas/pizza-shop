import { api } from "@/lib/axios";

interface GetManagedRestaurantUsers {
    id: string
    name: string
    email: string
    createdAt: Date | null
    updatedAt: Date | null
    description: string | null
    managerId: string | null
}

export async function getManagedRestaurant() {
    const response = await api.get<GetManagedRestaurantUsers>('managed-restaurant')

    return response.data
}