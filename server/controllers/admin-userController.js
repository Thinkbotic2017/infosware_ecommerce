const user = require('../models/user-model');

// *-------------------------
//     getAllUsers Logic 
// *-------------------------
const getAllUsers = async (req, res, next) => {
   try {
       const users = await user.find({}, { password: 0 });
       if (!users || users.length === 0) {
           return res.status(404).json({ msg: "No user found" });
       }
       return res.status(200).json(users);

   } catch (error) {
       next(error);
   }
}

// *-------------------------
//     get single Users Logic 
// *-------------------------
const getUserById = async (req,res,next) => {
    try {
        const id =req.params.id;
        const data = await user.findOne({_id:id}, { password: 0 });
        return res.status(200).json({msg: data});

    } catch (error) {
        next(error);   
    }
}

// *-------------------------
//     Update Users Logic 
// *-------------------------
 updateUserById =
async (req, res, next) => {

  try {

    const id =
      req.params.id;

    const {

      username,

      email,

      phone,

      firstname,

      lastname,

      gender,

      isAdmin,

    } = req.body;

    // USERNAME REGEX

    const usernameRegex =
/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;

    // EMAIL REGEX

    const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // REMOVE +91

    const cleanPhone =
phone.replace("+91", "").trim();

    // PHONE REGEX

    const phoneRegex =
/^[0-9]{10}$/;

    // USERNAME

    if (

!username ||

!usernameRegex.test(
username.trim()
)

    ) {

      return res.status(400).json({

        message:
"Username should contain only letters and numbers",
      });
    }

    // EMAIL

    if (

!email ||

!emailRegex.test(
email.trim()
)

    ) {

      return res.status(400).json({

        message:
"Invalid email address",
      });
    }

    // PHONE

    if (

!phoneRegex.test(
cleanPhone
)

    ) {

      return res.status(400).json({

        message:
"Phone number must be 10 digits",
      });
    }

    // FIRST NAME

    if (

firstname &&

!usernameRegex.test(
firstname.trim()
)

    ) {

      return res.status(400).json({

        message:
"First name should contain only letters and numbers",
      });
    }

    // LAST NAME

    if (

lastname &&

!usernameRegex.test(
lastname.trim()
)

    ) {

      return res.status(400).json({

        message:
"Last name should contain only letters and numbers",
      });
    }

    // GENDER

    const validGender =

["Male", "Female", "Other"];

    if (

gender &&

!validGender.includes(
gender
)

    ) {

      return res.status(400).json({

        message:
"Invalid gender selected",
      });
    }

    // UPDATED DATA

    const updateUserData = {

      username:
username.trim(),

      email:
email.trim(),

      phone:
`+91${cleanPhone}`,

      firstname:
firstname?.trim(),

      lastname:
lastname?.trim(),

      gender,

      isAdmin,
    };

    const updatedData =
await user.updateOne(

      { _id: id },

      { $set: updateUserData }
    );

    return res.status(200).json({

      success: true,

      message:
"User updated successfully",

      data: updatedData,
    });

  } catch (error) {

    next(error);
  }
};



// *-------------------------
//     deleteAllUsers Logic 
// *-------------------------
const deleteUserById = async (req,res,next) => {
    try {
        const id =req.params.id;
        await user.deleteOne({_id:id});
        return res.status(200).json({msg:"User deleted successfully"});

    } catch (error) {
        next(error);   
    }
}

module.exports = { getAllUsers,deleteUserById,getUserById,updateUserById };