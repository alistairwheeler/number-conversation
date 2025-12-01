

// Types
interface User {
    id: number;
    username: string;
    password_hash: string; // In mock, we'll store plain text or simple hash for simplicity
}

interface Post {
    id: number;
    user_id: number;
    parent_id: number | null;
    operation: string | null;
    operand: number | null;
    result: number;
    created_at: string;
}

// Helpers
const getUsers = (): User[] => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = (users: User[]) => localStorage.setItem('users', JSON.stringify(users));
const getPosts = (): Post[] => JSON.parse(localStorage.getItem('posts') || '[]');
const setPosts = (posts: Post[]) => localStorage.setItem('posts', JSON.stringify(posts));

// Mock API
export const mockApi = {
    post: async (url: string, data: any) => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

        if (url === '/auth/register') {
            const users = getUsers();
            if (users.find(u => u.username === data.username)) {
                return Promise.reject({ response: { data: { error: 'Username already exists' } } });
            }
            const newUser = { id: Date.now(), username: data.username, password_hash: data.password };
            users.push(newUser);
            setUsers(users);
            return { data: { message: 'User registered successfully' } };
        }

        if (url === '/auth/login') {
            const users = getUsers();
            const user = users.find(u => u.username === data.username && u.password_hash === data.password);
            if (!user) {
                return Promise.reject({ response: { data: { error: 'Invalid credentials' } } });
            }
            return { data: { token: 'mock-token', username: user.username } };
        }

        if (url === '/posts') {
            const posts = getPosts();
            const newPost = {
                id: Date.now(),
                user_id: 1, // Mock user ID
                parent_id: null,
                operation: null,
                operand: null,
                result: data.value,
                created_at: new Date().toISOString()
            };
            posts.push(newPost);
            setPosts(posts);
            return { data: { message: 'success', data: { ...newPost, username: 'You' } } };
        }

        if (url.match(/\/posts\/\d+\/reply/)) {
            const parentId = parseInt(url.split('/')[2]);
            const posts = getPosts();
            const parent = posts.find(p => p.id === parentId);

            if (!parent) return Promise.reject({ response: { data: { error: 'Parent not found' } } });

            let result = parent.result;
            const numOperand = parseFloat(data.operand);

            switch (data.operation) {
                case '+': result += numOperand; break;
                case '-': result -= numOperand; break;
                case '*': result *= numOperand; break;
                case '/':
                    if (numOperand === 0) return Promise.reject({ response: { data: { error: 'Division by zero' } } });
                    result /= numOperand;
                    break;
            }

            const newPost = {
                id: Date.now(),
                user_id: 1,
                parent_id: parentId,
                operation: data.operation,
                operand: numOperand,
                result: result,
                created_at: new Date().toISOString()
            };
            posts.push(newPost);
            setPosts(posts);
            return { data: { message: 'success', data: { ...newPost, username: 'You' } } };
        }

        return Promise.reject({ response: { data: { error: 'Not found' } } });
    },

    get: async (url: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (url === '/posts') {
            const posts = getPosts();
            const users = getUsers();
            const postsWithUser = posts.map(p => ({
                ...p,
                username: users.find(u => u.id === p.user_id)?.username || 'Unknown'
            }));
            return { data: { message: 'success', data: postsWithUser } };
        }
        return Promise.reject({ response: { data: { error: 'Not found' } } });
    }
};
