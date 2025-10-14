

const bcrypt = require('bcrypt'); 

class UpdateUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 
     * @param {number} userId 
     * @param {Object} updates 
     */
    async execute(userId, updates) {

        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        let { username, email, password } = updates;
        let passwordHash = existingUser.passwordHash;


        if (password) {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(password, saltRounds);
        }
        

        const updatedUser = await this.userRepository.update(
            userId, 
            username, 
            email, 
            passwordHash
        );


        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email
        };
    }
}

module.exports = UpdateUser;