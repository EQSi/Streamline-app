import bcrypt from 'bcrypt';
import prisma from './src/prismaClient'; // Adjust the path if necessary

const hashPasswords = async () => {
  try {
    // Fetch all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      if (!user.password.startsWith('$2b$')) { // Check if it's already hashed
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Update the user with the hashed password
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });

        console.log(`Updated password for user: ${user.username}`);
      }
    }

    console.log('All passwords updated successfully!');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
};

hashPasswords();
