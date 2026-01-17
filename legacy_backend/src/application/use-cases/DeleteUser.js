

class DeleteUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 
     * @param {number} userId 
     */
    async execute(userId) {

        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        // 2. Ejecución de la operación
        await this.userRepository.delete(userId);
        return true;
    }
}

module.exports = DeleteUser;