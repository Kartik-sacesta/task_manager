const Task = require("../model/Task");
const User=require("../model/User");


const createTask = async (req, res) => {
    const { title, description, expried_date,status,priority } = req.body;
    
    if (!title ) {
        return res.status(400).json({ message: "Title and created_by are required" });
    }
    
    try {
        const newTask = await Task.create({
        title,
        description,
        created_by:req.user.id, 
        expried_date,
        status: status || "pending",
        priority 
        });
    
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
    }


const getTasks = async (req, res) => {
    try {
        const userId = req.user.id; 
        const tasks = await Task.findAll({
            where: { is_active: true  , created_by: userId },
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const getTaskById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const task = await Task.findOne({
            where: { id, is_active: true }
        }); 
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const deleteTask = async (req, res) => {
    const { id } = req.params;
    
    try {
        const task = await Task.findOne({
            where: { id, is_active: true }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        await task.destroy();
        await task.update({ is_active: false });
        res.status(200).json({ message: "Task deleted successfully (soft delete)" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}   
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, expried_date, status } = req.body;
    try {
        const task = await Task.findOne({
            where: { id, is_active: true }
        });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        const updatedTask = await task.update({
            title,
            description,
            expried_date,
            status
        });
        
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}




module.exports = {
    createTask, 
    getTasks,
    getTaskById,
    deleteTask,
    updateTask,

};