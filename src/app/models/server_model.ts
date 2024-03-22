import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';
import { hash } from '../services/passwords';

const register = async (firstName: string, lastName: string, email: string, password: string): Promise<ResultSetHeader> => {

    Logger.info(`Adding user ${firstName} ${lastName} to the database`)
    password = await hash(password)
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password) values ( ?,?,?,? )';
    const [result] = await conn.query(query, [firstName, lastName, email, password]);
    await conn.release();
    return result;


}
const getOne = async (email: string): Promise<User[]> => {
    Logger.info(`Getting user ${email} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [rows] = await conn.query(query, [email]);
    await conn.release();
    return rows;
}

const getOneById = async (id: number): Promise<User[]> => {
    Logger.info(`Getting user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;
}
const addToken = async (email: string, token: string): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where email = ?';
    const [result] = await conn.query(query, [token, email]);
    await conn.release();
    return result;

}
const removeToken = async (token: string): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = NULL where auth_token = ?';
    const [result] = await conn.query(query, [token]);
    await conn.release();
    return result;

}
const read = async(id: number): Promise<User[]> => {
    const conn = await getPool().getConnection();
    const query = "SELECT first_name, last_name, email, auth_token FROM user WHERE id = ?";
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;

}
const update = async (firstName: string, lastName: string, email: string, password: string, id: number): Promise<ResultSetHeader> => {
    const query = "UPDATE user SET first_name = ?, last_name = ?, email =?, password=? WHERE id = ?"
    const [result] = await getPool().query(query,[firstName, lastName, email, password, id]);
    return result
}
export { register, getOne, addToken, removeToken, read, update, getOneById }