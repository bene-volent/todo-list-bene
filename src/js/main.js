import "../css/style.css"
import TodoList, { TodoProject, TodoDate, TodoTask } from "./todo.js";
import { removeAllChildren } from "./utils.js";
import capitalize from "lodash.capitalize"

import { format as dateFormat } from "date-fns";

let todoList = new TodoList()

const today = dateFormat(new Date(), "yyyy-MM-dd")

const sideBarButton = document.querySelector('.hamburger')
const sideBar = document.querySelector(".sidebar")
const buttonToSelect = Array.from(document.querySelectorAll(".selected"))

const projectListContainer = document.querySelector(".projects-button-container")
const taskListContainer = document.querySelector(".tasks-grid")


const addNewProjectBtn = document.querySelector(".projects-addNew")
const addNewTaskBtn = document.querySelector(".content-addNewTask")

const modelAddNewProject = document.querySelector(".modal.addNewProject")
const formAddNewProject = document.querySelector(".form-addNewProject")
const formAddNewProjectSubmit = document.querySelector(".form-addNewProject-submit")

const modelAddNewTask = document.querySelector(".modal.addNewTask")
const formAddNewTask = document.querySelector(".form-addNewTask")
const formAddNewTasksSubmit = document.querySelector(".form-addNewTask-submit")
const formAddNewTasksProjects = formAddNewTask.taskProject
formAddNewTask.taskDueDate.setAttribute("min", today)


function handleUntilBtn(untilID) {
    removeAllChildren(taskListContainer)
    let tasks;


    switch (untilID) {
        case 0:
            tasks = todoList.getTodayTask()
            break
        case 1:
            tasks = todoList.getWeekTask()
            break
        case 2:
            tasks = todoList.getMonthTasks()
            break
    }

    tasks.forEach(task => {
        addNewTaskUI(task.name, task.dueDate.toDateString(), todoList.projects[task.projectID].name, task.completed)
    })

}
function handleProjectBtn(projectID) {
    removeAllChildren(taskListContainer)

    let tasks = todoList.getProjectTaskID(projectID)
    tasks.forEach(task => {
        addNewTaskUI(task.name, task.dueDate.toDateString(), todoList.projects[projectID].name, task.completed)
    })
}

function handleDueClick(btn) {
    buttonToSelect.forEach(bttn => bttn.dataset.selected = false)

    btn.dataset.selected = true

    if (btn.dataset.until) {
        handleUntilBtn(parseInt(btn.dataset.until))
    }
    else {
        handleProjectBtn(btn.dataset.id)
    }

    document.querySelector(".content-selected").textContent = btn.dataset.name

    if (sideBarButton.dataset.open == "true")
        setTimeout(
            () => sideBarButton.click(), 100
        )

}

function deleteTask(taskID) {
    const taskUI = document.querySelector(`[data-id="${taskID}"]`)
    todoList.removeTask(taskID)

    if (taskUI == null || taskUI == undefined) return
    {
        removeAllChildren(taskUI)
        taskUI.remove()
    }
    todoList.saveInLocalStorage()
}

function deleteProject(projectID) {
    const projectUI = document.querySelector(`[data-id="${projectID}"]`)

    const tasks = todoList.getProjectTaskID(projectID)

    tasks.forEach(task => deleteTask(task.ID))

    todoList.removeProjectByID(projectID)

    removeProjectFromOption(projectID)
    removeAllChildren(projectUI)

    projectUI.remove()

    todoList.saveInLocalStorage()
}

function addNewProjectUI(name = "Project") {
    // To add Project to options in Add New Task
    addProjectToOptions(name)

    // Function Logic

    const projectID = TodoProject.getProjectToken(name)

    let listItem = document.createElement("li")
    let button = document.createElement("div")
    button.className = "project selected | w-full py-1 px-4 mt-2 rounded flex items-center justify-between data-[selected=true]:bg-neutral-500 data-[selected=true]:font-bold cursor-pointer capitalize"
    button.dataset.id = projectID
    button.dataset.name = capitalize(name)


    let nameEl = document.createElement("span")
    nameEl.className = "flex items-center gap-4 text-lg"
    nameEl.innerHTML = `<iconify-icon icon='bi:list-task'></iconify-icon><span>${capitalize(name)}</span>`



    const projectDelete = document.createElement("button")
    projectDelete.type = 'button'
    projectDelete.className = "task-delete | p-1 aspect-square flex items-center justify-center rounded hover:outline-1 hover:outline-neutral-50 hover:outline"
    projectDelete.innerHTML = '<iconify-icon icon="mdi:delete"></iconify-icon><span class="sr-only">Remove Project</span>'


    projectDelete.addEventListener('click', (event) => {
        event.stopPropagation()
        deleteProject(projectID)
    })

    button.append(nameEl, projectDelete)

    listItem.append(button)
    projectListContainer.appendChild(listItem)
    buttonToSelect.push(button)
    button.addEventListener("click", () => handleDueClick(button))



}

function removeProjectFromOption(projectID) {
    formAddNewTasksProjects.querySelector(`[data-id='${projectID}'`).remove()

}

function addProjectToOptions(projectName) {
    const option = document.createElement("option")

    option.value = projectName
    option.dataset.id = TodoProject.getProjectToken(projectName)
    option.textContent = capitalize(projectName)
    formAddNewTasksProjects.append(option)
}

function addNewTaskUI(name, dueDate, projectName, completed = false) {
    const taskID = TodoTask.getTaskToken(name, projectName)
    let taskContainer = document.createElement("div")
    taskContainer.className = "task | flex items-center gap-4 text-lg py-3 px-5 rounded-md bg-neutral-600"
    taskContainer.dataset.id = taskID

    const taskCompleted = document.createElement("button")
    taskCompleted.type = "button"
    taskCompleted.className = "task-completed | h-5 rounded-full aspect-square border-2 border-neutral-50 bg-neutral-900 hover:data-[completed=false]:bg-neutral-600"
    taskCompleted.dataset.completed = completed
    taskCompleted.innerHTML = '<span class="sr-only" > Not Completed</span >'

    taskCompleted.addEventListener("click", () => {
        const newCompletedState = taskCompleted.dataset.completed == "false"
        taskCompleted.dataset.completed = newCompletedState
        todoList.tasks[taskID].completed = newCompletedState
        todoList.saveInLocalStorage()
    })

    const taskName = document.createElement("p")
    taskName.className = "task-name | w-full flex items-start  flex-col gap-2 sm:items-center sm:gap-4 sm:flex-row sm:justify-between sm:text-lg"
    taskName.innerHTML = `<p class="flex flex-col items-baseline gap-1"><strong>${name}</strong></em ><em class="text-sm">${capitalize(projectName)}</em> </p><em class="text-sm" > By ${dateFormat(new Date(dueDate), "MMM dd, yyyy ")}`



    const taskDelete = document.createElement("button")
    taskDelete.type = 'button'
    taskDelete.className = "task-delete | p-1 aspect-square flex items-center justify-center rounded hover:outline-1 hover:outline-neutral-50 hover:outline"
    taskDelete.innerHTML = '<iconify-icon icon="mdi:delete"></iconify-icon><span class="sr-only">Remove Task</span>'


    taskDelete.addEventListener('click', () => {
        deleteTask(taskID)
    })

    taskContainer.append(taskCompleted, taskName, taskDelete)

    taskListContainer.append(taskContainer)



}



buttonToSelect.forEach(btn => {
    btn.addEventListener('click',
        () => handleDueClick(btn)
    )
}
)

sideBarButton.addEventListener("click", () => {
    let open = sideBarButton.dataset.open == 'false'
    sideBarButton.dataset.open = open
    sideBar.dataset.open = open
})


addNewProjectBtn.addEventListener("click", () => {
    modelAddNewProject.showModal()
})
addNewTaskBtn.addEventListener("click", () => {
    modelAddNewTask.showModal()
})


formAddNewProjectSubmit.addEventListener("click", (event) => {
    event.preventDefault()

    const name = formAddNewProject.projectName.value.toLowerCase()
    if (name.length === 0) {
        alert("Your project must have a name!")
        return
    }
    if (todoList.addProject(name)) {

        addNewProjectUI(name)

        formAddNewProject.projectName.value = ''

        todoList.saveInLocalStorage()

        modelAddNewProject.close()
    }
})


formAddNewTasksSubmit.addEventListener("click", (event) => {
    event.preventDefault()

    const name = formAddNewTask.taskName.value
    const dueDate = formAddNewTask.taskDueDate.value
    const project = formAddNewTask.taskProject.value

    if (name.length === 0) {
        alert("Task must have a name!")
        return
    }
    if (dueDate.length === 0) {
        alert("A due date must be chosen!")
        return
    }
    if (project === "0") {
        alert("A project must be selected!")
        return
    }



    if (todoList.addTodoTask(name, project, dueDate)) {

        addNewTaskUI(name, dueDate, project)

        formAddNewTask.taskName.value = ""
        formAddNewTask.taskDueDate.value = ""
        formAddNewTask.taskProject.value = "0"

        todoList.saveInLocalStorage()

        modelAddNewTask.close()
    }

})

document.addEventListener("DOMContentLoaded", () => {

    todoList.getFromLocalStorage()

    for (let projectID in todoList.projects) {
        let project = todoList.projects[projectID]

        addNewProjectUI(project.name)
    }
    for (let taskID in todoList.tasks) {
        let task = todoList.tasks[taskID]
        let projectName = todoList.projects[task.projectID].name

        addNewTaskUI(task.name, task.dueDate.toDateString(), projectName)
    }


    document.querySelector("[data-name='Today'][data-until='0']").click()
    console.log("Data Loaded From Local Storage!")

})


