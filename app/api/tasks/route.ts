import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

// Define task status types
type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Define task interface
interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high';
}

// Mock data for demonstration
const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Kiểm tra hệ thống camera bãi A',
        description: 'Kiểm tra tình trạng hoạt động của các camera giám sát tại bãi đỗ xe A và báo cáo các vấn đề nếu có.',
        status: 'pending',
        dueDate: '2023-11-25',
        assignedTo: 'staff1',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Hướng dẫn khách hàng mới',
        description: 'Hỗ trợ khách hàng mới làm quen với hệ thống đỗ xe và giải đáp thắc mắc.',
        status: 'in-progress',
        dueDate: '2023-11-23',
        assignedTo: 'staff1',
        priority: 'medium'
    },
    {
        id: '3',
        title: 'Cập nhật bảng thông báo',
        description: 'Cập nhật các thông báo mới về quy định đỗ xe và giá cả lên bảng thông báo.',
        status: 'completed',
        dueDate: '2023-11-20',
        assignedTo: 'staff1',
        priority: 'low'
    },
    {
        id: '4',
        title: 'Kiểm tra hệ thống thanh toán',
        description: 'Kiểm tra và đảm bảo hệ thống thanh toán tự động hoạt động bình thường.',
        status: 'pending',
        dueDate: '2023-11-26',
        assignedTo: 'staff1',
        priority: 'high'
    },
    {
        id: '5',
        title: 'Báo cáo tình trạng bãi đỗ xe',
        description: 'Lập báo cáo hàng tuần về tình trạng sử dụng bãi đỗ xe và các vấn đề phát sinh.',
        status: 'in-progress',
        dueDate: '2023-11-24',
        assignedTo: 'staff1',
        priority: 'medium'
    }
];

export async function GET() {
    try {
        // Get the current user session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real application, you would fetch tasks from a database
        // based on the current user's ID or role
        // For now, we'll use mock data

        // Filter tasks assigned to the current user
        // In this mock example, we're using 'staff1' as the default assignee
        const userTasks = mockTasks;//.filter(task => task.assignedTo === 'staff1');

        return NextResponse.json({ success: true, tasks: userTasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
