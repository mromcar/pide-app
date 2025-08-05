import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { UserRole } from '@prisma/client';
import logger from '@/lib/logger';

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Asignar rol 'client' por defecto para nuevos registros
    const userData = {
      ...body,
      role: UserRole.client, // Usar el rol 'client' por defecto
      establishment_id: null // Los clientes no tienen establecimiento asignado inicialmente
    };

    const newUser = await userService.createUser(userData);

    logger.info(`New user registered: ${newUser.email}`);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error: unknown) {
    logger.error('Error registering user:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'Email already exists'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Registration failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const users = await userService.getAllUsers(page, pageSize);

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error: unknown) {
    logger.error('Error fetching users:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users'
    }, { status: 500 });
  }
}
