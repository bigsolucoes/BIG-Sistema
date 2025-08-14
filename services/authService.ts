import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { User } from '../types'
import bcrypt from 'bcryptjs'

export class AuthService {
  async signUp(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Development mode fallback
      if (!isSupabaseConfigured) {
        console.warn('Development mode: Creating mock user')
        const mockUser: User = {
          id: `dev_${Date.now()}`,
          username: username.toLowerCase()
        }
        return { user: mockUser, error: null }
      }

      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())

      if (checkError) {
        return { user: null, error: 'Erro ao verificar usuário existente' }
      }

      if (existingUsers && existingUsers.length > 0) {
        return { user: null, error: 'Nome de usuário já existe' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: hashedPassword,
        options: {
          data: {
            username: username.toLowerCase()
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Insert user data into our users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            username: username.toLowerCase(),
            email: email.toLowerCase()
          }])

        if (insertError) {
          console.error('Error inserting user data:', insertError)
        }

        return {
          user: {
            id: data.user.id,
            username: username.toLowerCase()
          },
          error: null
        }
      }

      return { user: null, error: 'Falha ao criar usuário' }
    } catch (error) {
      console.error('SignUp error:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  async signIn(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Admin fallback
      if (username.toLowerCase() === 'admin' && password === 'admin') {
        const adminUser: User = { id: 'admin_user_id', username: 'admin' }
        return { user: adminUser, error: null }
      }

      // Development mode fallback
      if (!isSupabaseConfigured) {
        console.warn('Development mode: Mock login')
        const mockUser: User = {
          id: `dev_${username.toLowerCase()}`,
          username: username.toLowerCase()
        }
        return { user: mockUser, error: null }
      }

      // Get user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .single()

      if (userError || !userData) {
        return { user: null, error: 'Usuário não encontrado' }
      }

      // Get user auth data
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password
      })

      if (authError) {
        return { user: null, error: 'Credenciais inválidas' }
      }

      if (authData.user) {
        return {
          user: {
            id: authData.user.id,
            username: userData.username
          },
          error: null
        }
      }

      return { user: null, error: 'Falha no login' }
    } catch (error) {
      console.error('SignIn error:', error)
      return { user: null, error: 'Erro interno do servidor' }
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('SignOut error:', error)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get username from our users table
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()

        return {
          id: user.id,
          username: userData?.username || user.email || 'User'
        }
      }

      return null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single()

        callback({
          id: session.user.id,
          username: userData?.username || session.user.email || 'User'
        })
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
