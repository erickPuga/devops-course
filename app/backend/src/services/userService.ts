import { supabase } from '../db.js';
import { hashPassword, comparePasswords } from '../utils.js';
import { User, RegisterRequest, LoginRequest, UpdateProfileRequest, ChangePasswordRequest } from '../types.js';

class UserService {
  // Crear nuevo usuario
  async register(data: RegisterRequest): Promise<User> {
    const { email, password, name, dailyCalorieGoal } = data;

    // Verificar que el email no exista
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Insertar usuario
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        daily_calorie_goal: dailyCalorieGoal,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return this.formatUser(newUser);
  }

  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }

    return data ? this.formatUser(data) : null;
  }

  // Obtener usuario por ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }

    return data ? this.formatUser(data) : null;
  }

  // Verificar credenciales de login
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    // Obtener el hash de la contraseña
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Error al validar credenciales: ${error.message}`);
    }

    const isPasswordValid = await comparePasswords(password, data.password_hash);
    return isPasswordValid ? user : null;
  }

  // Actualizar perfil
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }
    if (data.dailyCalorieGoal !== undefined) {
      updateData.daily_calorie_goal = data.dailyCalorieGoal;
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }

    return this.formatUser(updatedUser);
  }

  // Cambiar contraseña
  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener hash actual
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Error al obtener usuario: ${fetchError.message}`);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await comparePasswords(
      data.currentPassword,
      userData.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await hashPassword(data.newPassword);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Error al cambiar contraseña: ${updateError.message}`);
    }
  }

  // Método auxiliar para formatear usuario
  private formatUser(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      dailyCalorieGoal: userData.daily_calorie_goal,
      avatarUrl: userData.avatar_url || null,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };
  }
}

export const userService = new UserService();
