const { createApp } = Vue;
// --- 1. Define Our Page Components ---

// The "Home" page component
const Home = {
    template: `
        <div class="home-view">
            <!-- Form for adding a new task -->
            <section class="card">
                <h2>Add a New Task</h2>
                <form @submit.prevent="addTask" class="task-form">
                    <input type="text" v-model="newTask.title" placeholder="What needs to be done?" class="form-input" required>
                    
                    <select v-model="newTask.priority" class="form-input">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    <input type="date" v-model="newTask.due_date" class="form-input">
                    
                    <div class="form-submit-area">
                        <button type="submit" class="primary-button">Add Task</button>
                    </div>
                </form>
            </section>

            <!-- List of existing tasks -->
            <section class="card">
                <h2>My Task List ({{ tasks.length }})</h2>
                <p v-if="tasks.length === 0">You have no tasks yet. Add one above!</p>
                <ul v-else class="task-list">
                    <li v-for="task in sortedTasks" :key="task.id" 
                        :class="['task-item', getPriorityClass(task.priority), { 'completed': task.is_completed }]">
                        
                        <div class="task-details">
                            <input type="checkbox" :checked="task.is_completed" @change="toggleTask(task)">
                            <div>
                                <span>{{ task.title }}</span>
                                <div v-if="task.due_date" class="due-date">
                                    Due: {{ new Date(task.due_date).toLocaleDateString() }}
                                </div>
                            </div>
                        </div>
                        <button @click="deleteTask(task.id)" class="delete-button">Delete</button>
                    </li>
                </ul>
            </section>
        </div>
    `,
    data() {
        return {
            tasks: [],
            newTask: {
                title: '',
                priority: 'medium',
                due_date: null
            },
            apiUrl: 'http://127.0.0.1:8000/api/tasks'
        };
    },
    computed: {
        sortedTasks() {
            return [...this.tasks].sort((a, b) => {
                if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
                return a.due_date ? -1 : 1;
            });
        }
    },
    methods: {
        async fetchTasks() {
            try {
                const response = await fetch(this.apiUrl);
                if (!response.ok) throw new Error('Failed to fetch tasks');
                this.tasks = await response.json();
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        },
        async addTask() {
            if (!this.newTask.title.trim()) return;
            try {
                await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: this.newTask.title,
                        priority: this.newTask.priority,
                        due_date: this.newTask.due_date || null
                    })
                });
                this.newTask = { title: '', priority: 'medium', due_date: null };
                await this.fetchTasks();
            } catch (error) {
                console.error("Error adding task:", error);
            }
        },
        async updateTask(task) {
            try {
                await fetch(`${this.apiUrl}/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                await this.fetchTasks();
            } catch (error) {
                console.error("Error updating task:", error);
            }
        },
        toggleTask(task) {
            const updatedTask = { ...task, is_completed: !task.is_completed };
            this.updateTask(updatedTask);
        },
        async deleteTask(taskId) {
            try {
                await fetch(`${this.apiUrl}/${taskId}`, { method: "DELETE" });
                await this.fetchTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        },
        // *** THIS IS THE CHANGED PART ***
        getPriorityClass(priority) {
            switch (priority) {
                case 'high': return 'priority-high';
                case 'medium': return 'priority-medium';
                case 'low': return 'priority-low';
                default: return '';
            }
        }
    },
    mounted() {
        this.fetchTasks();
    }
};

// The "About" page component
const About = {
    template: `
        <div class="card">
            <h2>About This App</h2>
            <p>This is a simple but awesome To-Do application built with Vue.js, Flask, and FastAPI.</p>
            <p>You can add, delete, and complete tasks. Now with priorities and due dates!</p>
        </div>
    `
};

// --- 2. Define The Routes ---
const routes = [
    { path: '/', component: Home },
    { path: '/about', component: About },
];

// --- 3. Create The Router Instance ---
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes, 
});

// --- 4. Create and Mount The Main Vue App ---
const app = createApp({});
app.use(router);
app.mount('#app');