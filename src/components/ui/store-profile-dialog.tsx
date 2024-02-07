import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { GetManagedRestaurantResponse, getManagedRestaurant } from "@/api/get-managed-restaurant";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { updateProfile } from "@/api/update-profile";
import { toast } from "sonner";



const storeProfileSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
})

type StoreProfileSchema = z.infer<typeof storeProfileSchema>



export function StoreProflieDialog() {
        const queryClient = useQueryClient()

        const { data: managedRestaurant } = useQuery({
            queryKey: ['managed-restaurant'],
            queryFn: getManagedRestaurant,
            staleTime: Infinity,
        })


        const { register, handleSubmit, formState:  { isSubmitting }} = useForm<StoreProfileSchema>({
            resolver: zodResolver(storeProfileSchema),
            values: {
                name: managedRestaurant?.name ?? '',
                description: managedRestaurant?.description ?? '',
            }
        })

        function updatedManagedRestaurantCache({ name, description }: StoreProfileSchema) {
            const cached = queryClient.getQueryData<GetManagedRestaurantResponse>(['managed-restaurant'])
        
            if (cached) {
                queryClient.setQueryData<GetManagedRestaurantResponse>(['managed-restaurant'], {
                    ...cached,
                    name,
                    description,
                })
            }  
            
            return { cached }
        }
        
        const { mutateAsync: updateProfileFn } = useMutation({
            mutationFn: updateProfile,
            onMutate({ name, description }) {
               const { cached } = updatedManagedRestaurantCache({ name, description })

               return { previousProfile: cached }
            },
            onError(_, __, context) {
                if (context?.previousProfile) {
                    updatedManagedRestaurantCache(context.previousProfile)
                }
            }
        })
             
       

        async function handleUpdateProfile(data: StoreProfileSchema) {
            try {
                await updateProfileFn({
                    name: data.name,
                    description: data.description,
                })

                toast.success('Perfil atualizado com sucesso!')
            } catch {
                toast.error('Falha ao atualizar o perfil, tente novamente')
            }
        }



    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Perfil da loja</DialogTitle>
                <DialogDescription>
                    Atualize as informações do seu estabelecimento visíveis ao seu cliente
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdateProfile)}>
                <div className="space-y-4 py-4">
                
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right" htmlFor="name">
                            Nome
                        </Label>
                        <Input className="col-span-3" id="name" {...register('name')} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right" htmlFor="description">
                            Descrição
                        </Label>
                        <Textarea className="col-span-3" id="description" {...register('description')} />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" variant="sucess" disabled={isSubmitting}>Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}