const app = Vue.createApp({
    data() {
        return {
            tasks:[],
            newTaskTitle:'',
            apiUrl:'http://126.0.0.1:8000/api/tasks'
        }
    },
    methods:{
        async fetchTasks() {
            const response = await fetch(this.apiUrl);
            this.tasks = await response.json();
        },

        async addTask(){
            if(!this.newTaskTitle.trim()) return;
            await fetch(this.apiUrl,{
                method:'POST',
                headers: {"Content-Type":'application/json'},
                body: JSON.stringify({title: this.newTaskTitle})
            });
            this.newTaskTitle="";
            await this.fetchTasks();
        },

        async toggleTask(task){
            await fetch(`${this.apiUrl}/${task.id}`,{
                method:'PUT',
                headers:{'Contet-Type': 'application/json'},
                body: JSON.stringify({...task,is_completed:!task.is_completed})
            });
            await this.fetchTasks();
        },

        async deleteTask(taskId) {
            await fetch(`${this.apiUrl}/${taskId}`,{method:"DELETE"});
            await this.fetchTasks();
        }  
    },
    mounted() {
        this.fetchTasks();
    }
});

app.mount('#app');