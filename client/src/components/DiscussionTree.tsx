import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Post {
    id: number;
    user_id: number;
    parent_id: number | null;
    operation: string | null;
    operand: number | null;
    result: number;
    username: string;
    children?: Post[];
}

interface DiscussionTreeProps {
    posts: Post[];
    refreshPosts: () => void;
}

const PostNode = ({ post, refreshPosts }: { post: Post; refreshPosts: () => void }) => {
    const { isAuthenticated } = useAuth();
    const [showReply, setShowReply] = useState(false);
    const [operation, setOperation] = useState('+');
    const [operand, setOperand] = useState('');

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/posts/${post.id}/reply`, { operation, operand });
            setShowReply(false);
            setOperand('');
            refreshPosts();
        } catch (err) {
            console.error('Failed to reply', err);
        }
    };

    return (
        <div className="post-node">
            <div className="post-content">
                <span className="post-value">{post.result}</span>
                {post.operation && (
                    <span className="post-operation">
                        ({post.operation} {post.operand})
                    </span>
                )}
                <span className="post-author">by {post.username || 'Unknown'}</span>
                {isAuthenticated && (
                    <button className="reply-btn" onClick={() => setShowReply(!showReply)}>
                        Reply
                    </button>
                )}
            </div>
            {showReply && (
                <form className="reply-form" onSubmit={handleReply}>
                    <select value={operation} onChange={(e) => setOperation(e.target.value)}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                    </select>
                    <input
                        type="number"
                        value={operand}
                        onChange={(e) => setOperand(e.target.value)}
                        placeholder="Number"
                        required
                    />
                    <button type="submit">Send</button>
                </form>
            )}
            {post.children && post.children.length > 0 && (
                <div className="post-children">
                    {post.children.map((child) => (
                        <PostNode key={child.id} post={child} refreshPosts={refreshPosts} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DiscussionTree: React.FC<DiscussionTreeProps> = ({ posts, refreshPosts }) => {
    // Helper to build tree from flat list
    const buildTree = (posts: Post[]) => {
        const map = new Map<number, Post>();
        const roots: Post[] = [];

        posts.forEach((post) => {
            map.set(post.id, { ...post, children: [] });
        });

        posts.forEach((post) => {
            if (post.parent_id) {
                const parent = map.get(post.parent_id);
                if (parent) {
                    parent.children?.push(map.get(post.id)!);
                }
            } else {
                roots.push(map.get(post.id)!);
            }
        });
        return roots;
    };

    const tree = buildTree(posts);

    return (
        <div className="discussion-tree">
            {tree.map((root) => (
                <PostNode key={root.id} post={root} refreshPosts={refreshPosts} />
            ))}
        </div>
    );
};

export default DiscussionTree;
