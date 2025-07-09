const { Op } = require("sequelize");
const Task = require("../model/Task");
const User = require("../model/User");

const notificationController = {
  getDueDatesTimeline: async (req, res) => {
    try {
      

      const currentDate = new Date();
      const user_id=7;
      
      
console.log(currentDate)
      const tasks = await Task.findAll({
        // where: {
        //   expried_date: {
        //     [Op.lt]: [currentDate],
        //   },
        //   is_active: true,
          
        // },

        where:{
            id:12
        }
      });

      console.log(tasks.expried_date);

      res.status(200).json({message:"notification"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = notificationController;
