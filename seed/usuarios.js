import bcrypt from 'bcrypt';

const usuarios = [
    {   
        nombre: 'Erick',
        email: 'erick@erick.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10),
    },
    {    
        nombre: 'Manuel',
        email: 'gosny@gosny.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10),
    }
]

export default usuarios;