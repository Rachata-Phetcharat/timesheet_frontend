import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Clock, ShieldCheck, UserCheck, Lock, Mail, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'somchai@company.com',
      password: 'password123',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true)
    setErrorMessage(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบอีเมลหรือรหัสผ่าน'
      setErrorMessage(msg)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const fillDemoAccount = (role: 'employee' | 'admin') => {
    if (role === 'employee') {
      setValue('email', 'somchai@company.com')
      setValue('password', 'password123')
    } else {
      setValue('email', 'admin@company.com')
      setValue('password', 'admin12345')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-indigo-50/40 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Clock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            ระบบบันทึกเวลาทำงาน & การลา
          </h1>
          <p className="text-sm text-slate-500">
            Timesheet & Leave Management Application (JWT Auth)
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">เข้าสู่ระบบ (Sign In)</CardTitle>
            <CardDescription>
              กรอกอีเมลและรหัสผ่านพนักงานของคุณเพื่อเข้าใช้งานระบบ
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Input
                  label="อีเมล (Email)"
                  type="email"
                  placeholder="name@company.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="รหัสผ่าน (Password)"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-200"
                isLoading={isLoggingIn}
              >
                เข้าสู่ระบบ
              </Button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-3 border-t border-slate-100">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
                บัญชีทดสอบด่วน (Quick Demo)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                  onClick={() => fillDemoAccount('employee')}
                >
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                  พนักงาน (Employee)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                  onClick={() => fillDemoAccount('admin')}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  ผู้ดูแล (HR Admin)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          ระบบรองรับ JWT Access Token & Auto Token Refresh Interceptors
        </p>
      </div>
    </div>
  )
}
