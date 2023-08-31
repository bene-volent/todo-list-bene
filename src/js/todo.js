import { isToday, isWithinInterval } from "date-fns"
import { getFromLocalStorage, saveInLocalStorage } from "./utils.js"

function hyphenate(text) {
    return text.toLowerCase().split(" ").join("-")
}

class TodoDate extends Date {
    string() {
        return this.toLocaleDateString("en-us", { year: "numeric", month: "short", day: "2-digit" })
    }
    print() {
        return this.string()
    }
}

class TodoProject {

    static getProjectToken(name) {
        return hyphenate(name)
    }

    constructor(name, id) {
        this.name = name
        this.id = id
        this.tasks = []
    }

    addTask(token) {
        this.tasks.push(token)
    }

}

class TodoTask {
    constructor(name, ID, projectID, dueDate, completed = false) {
        this.name = name
        this.projectID = projectID
        this.ID = ID
        this.dueDate = new TodoDate(dueDate)

        this.createOn = Date.now()
        this.completed = completed
    }


    toggleComplete() {
        this.completed = !this.completed
    }

    static getTaskToken(name, projectName) {
        const nameToken = hyphenate(name)
        const projectToken = TodoProject.getProjectToken(projectName)

        return `${nameToken}-${projectToken}`
    }
}

class TodoList {
    constructor() {
        this.projects = {}
        this.tasks = {}
    }


    checkProjectExists(projectKey) {
        return !(this.projects[projectKey] == null || this.projects[projectKey] == undefined)
    }
    checkTaskExists(taskKey) {
        return !(this.tasks[taskKey] == null || this.tasks[taskKey] == undefined)
    }

    addProject(name) {

        const projectKey = TodoProject.getProjectToken(name)

        if (this.checkProjectExists(projectKey)) {
            console.error("Project Name already exists!");
            return false
        }
        this.projects[projectKey] = new TodoProject(name, projectKey)

        return true
    }
    addTodoTask(name, projectName, dueDate, completed = false) {

        const projectToken = TodoProject.getProjectToken(projectName)

        if (!this.checkProjectExists(projectToken)) { console.error("Project Name does not exists!"); return false }

        const taskToken = TodoTask.getTaskToken(name, projectName)

        if (this.checkTaskExists(taskToken)) {
            console.error("Same task already exists in the project!");
            return false
        }

        this.tasks[taskToken] = new TodoTask(name, taskToken, projectToken, dueDate, completed)
        this.projects[projectToken].addTask(taskToken)
        return true
    }
    getAllTasks() {
        return Object.values(this.tasks)
    }

    getProjectTasksName(projectName) {
        const projectToken = TodoProject.getProjectToken(projectName)

        if (!this.checkProjectExists(projectToken)) {
            { console.error("Project Name does not exists!"); return false }
        }

        return this.projects[projectToken].tasks.map((taskToken) => this.tasks[taskToken])
    }
    getProjectTaskID(projectID) {
        if (!this.checkProjectExists(projectID)) { console.error("Project Name does not exists!"); return false }
        return this.projects[projectID].tasks.map((taskToken) => this.tasks[taskToken])
    }

    getTaskProject(taskToken) {
        return this.projects[this.tasks[taskToken].projectID]
    }

    removeTask(taskToken) {
        let projectToken = this.tasks[taskToken].projectID
        delete this.tasks[taskToken]
        let projectTasks = this.projects[projectToken].tasks

        return projectTasks.splice(projectTasks.indexOf(taskToken), 1)
    }

    removeProject(projectName) {
        let projectToken = TodoProject.getProjectToken(projectName)
        let projectTasks = this.projects[projectToken].tasks

        delete this.projects[projectToken]

        projectTasks.forEach(taskToken => delete this.tasks[taskToken])

        // return this.tasks
    }
    removeProjectByID(projectToken) {
        let projectTasks = this.projects[projectToken].tasks

        delete this.projects[projectToken]

        projectTasks.forEach(taskToken => delete this.tasks[taskToken])

        // return this.tasks
    }
    getTodayTask() {
        return this.getAllTasks().filter(task => {
            return isToday(task.dueDate)
        })
    }
    getWeekTask() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const week = new Date()
        week.setDate(week.getDate() + 7)
        return this.getAllTasks().filter(task => {
            return isWithinInterval(task.dueDate, { start: today, end: week })
        })
    }
    getMonthTasks() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const month = new Date()
        month.setMonth(month.getMonth() + 1)
        return this.getAllTasks().filter(task => {
            return isWithinInterval(task.dueDate, { start: today, end: month })
        })
    }

    saveInLocalStorage() {
        const data = JSON.stringify({
            projects: this.projects,
            tasks: this.tasks
        }, 4)

        saveInLocalStorage("benes-todolist", data)
    }

    getFromLocalStorage() {
        let data = getFromLocalStorage("benes-todolist")

        if (data) {
            for (let projectKey in data.projects) {
                let project = data.projects[projectKey]
                this.addProject(project.name)
            }
            for (let taskKey in data.tasks) {
                let task = data.tasks[taskKey]
                this.addTodoTask(task.name, this.projects[task.projectID].name, task.dueDate, task.completed)
            }
        }

    }
}

export default TodoList
export { TodoDate, TodoProject, TodoTask }


