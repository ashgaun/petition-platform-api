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
const read = async (id: number): Promise<User[]> => {
    const conn = await getPool().getConnection();
    const query = "select first_name, last_name, email, auth_token from user where id = ?";
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;

}
const update = async (firstName: string, lastName: string, email: string, password: string, id: number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = "update user set first_name = ?, last_name = ?, email =?, password=? where id = ?";
    const [result] = await conn.query(query, [firstName, lastName, email, password, id]);
    return result;
}
const getImageName = async (id: number): Promise<string> => {
    const conn = await getPool().getConnection();
    const query = "Select image_filename from user where id = ?";
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result.length === 0 ? null : result[0].image_filename;
}
const putImageName = async(id: number, imageFilename: string): Promise<void> =>{
    const conn = await getPool().getConnection();
    const query = "update user set image_filename = ? where id = ? ";
    const result =  conn.query(query,[imageFilename, id]);
    await conn.release();

}
const deleteImageName = async(id:number): Promise<void> =>{
    const conn = await getPool().getConnection();
    const query = "update user set image_filename = null where id = ? ";
    const result = await conn.query(query, [id]);
    await conn.release();
}

export { register, getOne, addToken, removeToken, read, update, getOneById, getImageName,putImageName,deleteImageName }