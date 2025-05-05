import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/validators/authValidators"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useRegister } from "@/api/queries/authQueries"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const { mutate: registerUser, isPending } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      registerUser(data);
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <span className="text-2xl text-white font-bold">Logo</span>
        </motion.div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Inscription</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              {...register("firstName")}
              error={errors.firstName?.message}
              placeholder="Jean"
            />
            <Input
              label="Nom"
              {...register("lastName")}
              error={errors.lastName?.message}
              placeholder="Dupont"
            />
          </div>
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="votre@email.com"
          />
          <Input
            label="Mot de passe"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          loadingText="Inscription en cours..."
        >
          S'inscrire
        </Button>

        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
          >
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </form>
    </Card>
  )
}

