const mongoose = require('mongoose');

const NavbarSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    logo: {
        type: String
    }
});

const Navbar  =    mongoose.model('Navbar', NavbarSchema);
module.exports = Navbar;
