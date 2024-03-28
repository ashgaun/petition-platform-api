import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const getAllSuppporters = async (petitionId: number): Promise<Supporter[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT supporter.id AS supportId, support_tier_id AS supportTierId, message, user.id AS supporterId, user.first_name AS supporterFirstName, user.last_name AS supporterLastName, timestamp
    FROM supporter JOIN user ON supporter.user_id = user.id WHERE support_tier_id IN (SELECT id FROM support_tier WHERE petition_id = ?) Order by timestamp DESC;`;
    const [rows] = await conn.query(query, [petitionId]);
    await conn.release();
    return rows;

}
const checkSupporter = async (petitionId: number, userId: number, supportTierId: number): Promise<Supporter> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM supporter WHERE petition_id = ? AND user_id = ? AND support_tier_id = ?`;
    const [rows] = await conn.query(query, [petitionId, userId, supportTierId]);
    await conn.release();
    return rows;
}
const addSupporter = async (petitionId: number, userId: number, supportTierId: number, message: string): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `INSERT INTO supporter (petition_id, user_id, support_tier_id, message) VALUES (?, ?, ?, ?)`;
    const [result] = await conn.query(query, [petitionId, userId, supportTierId, message]);
    await conn.release();
    return result;
}
export { getAllSuppporters, checkSupporter, addSupporter};
