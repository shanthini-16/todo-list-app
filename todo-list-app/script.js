let tasks = [];
const API_URL = 'http://127.0.0.1:5000/api/tasks';

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Backend not running:', error);
        alert('⚠️ Backend not running! Start with: python app.py');
    }
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();
    if (text === "") return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const newTask = await response.json();
        tasks.push(newTask);
        input.value = "";
        renderTasks();
    } catch (error) {
        alert('Cannot connect to backend! Make sure python app.py is running');
    }
}

async function toggleComplete(index) {
    const task = tasks[index];
    task.completed = !task.completed;
    
    await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: task.completed })
    });
    renderTasks();
}

async function deleteTask(index) {
    const task = tasks[index];
    await fetch(`${API_URL}/${task.id}`, { method: 'DELETE' });
    tasks.splice(index, 1);
    renderTasks();
}

async function clearAllTasks() {
    tasks = [];
    await fetch('http://127.0.0.1:5000/api/tasks/all', { method: 'DELETE' });
    renderTasks();
}

function editTask(index, event) {
    event.stopPropagation();
    
    const li = document.querySelectorAll("#taskList li")[index];
    const span = li.querySelector("span");
    const currentText = tasks[index].text;
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.style.flex = "1";
    input.style.padding = "8px";
    input.style.border = "2px solid #b39ddb";
    input.style.borderRadius = "8px";
    input.style.fontSize = "16px";
    input.style.backgroundColor = "#e3f2fd";
    
    li.replaceChild(input, span);
    input.focus();
    
    input.addEventListener("keypress", async function(e) {
        if (e.key === "Enter") {
            const newText = input.value.trim();
            if (newText !== "") {
                tasks[index].text = newText;
                await fetch(`${API_URL}/${tasks[index].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: newText })
                });
            }
            renderTasks();
        }
    });
    
    input.addEventListener("blur", async function() {
        const newText = input.value.trim();
        if (newText !== "") {
            tasks[index].text = newText;
            await fetch(`${API_URL}/${tasks[index].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });
        }
        renderTasks();
    });
}

function updateCounter() {
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const counterElement = document.getElementById("taskCounter");
    
    if (pendingTasks === 0) {
        counterElement.innerHTML = "🎉 All tasks completed! Great job! 🎉";
        counterElement.style.background = "#e8f5e9";
        counterElement.style.color = "#4caf50";
    } else if (pendingTasks === 1) {
        counterElement.innerHTML = `📋 ${pendingTasks} task remaining`;
        counterElement.style.background = "#f0f0f0";
        counterElement.style.color = "#667eea";
    } else {
        counterElement.innerHTML = `📋 ${pendingTasks} tasks remaining`;
        counterElement.style.background = "#f0f0f0";
        counterElement.style.color = "#667eea";
    }
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.textContent = task.text;
        if (task.completed) {
            span.classList.add("completed");
        }
        span.style.cursor = "pointer";
        span.style.flex = "1";
        span.onclick = () => toggleComplete(index);
        
        const buttonDiv = document.createElement("div");
        buttonDiv.className = "task-buttons";
        
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.onclick = (event) => editTask(index, event);
        
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.classList.add("delete-btn");
        delBtn.onclick = () => deleteTask(index);
        
        buttonDiv.appendChild(editBtn);
        buttonDiv.appendChild(delBtn);
        
        li.appendChild(span);
        li.appendChild(buttonDiv);
        list.appendChild(li);
    });
    
    updateCounter();
}

document.getElementById("addBtn").addEventListener("click", addTask);
document.getElementById("taskInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") addTask();
});
document.getElementById("clearAllBtn").addEventListener("click", clearAllTasks);

loadTasks();