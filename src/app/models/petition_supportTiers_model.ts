import exp from 'constants';
import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const putSupportTier = async (title:string,description:string,cost:number,petitionId:number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `INSERT INTO support_tier (title,description,cost, petition_id) VALUES (?, ?, ?,?)`;
    const [result] = await conn.query(query, [title,description,cost,petitionId]);
    await conn.release();
    return result;
}
const patchSupportTier = async (title:string,description:string,cost:number, id:number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `UPDATE support_tier SET title = ?, description = ?, cost = ? WHERE id = ?`;
    const [result] = await conn.query(query, [title,description,cost, id]);
    await conn.release();
    return result;
}
const getSupportTiersByPetitionId = async (id: number): Promise<SupporterTier[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM support_tier WHERE petition_id = ?`;
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;
}

const getSupportersForSupporterTier = async (id: number): Promise<number> => {
    const conn = await getPool().getConnection();
    const query = `SELECT COUNT(*) as total from supporter WHERE support_tier_id = ?`;
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows[0].total;
}
const getSupportTierBySupportTierId = async (id: number): Promise<SupporterTier[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM support_tier WHERE id = ?`;
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;
}
const deleteSupportTier = async (id: number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `DELETE FROM support_tier WHERE id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

export { putSupportTier, patchSupportTier, getSupportTiersByPetitionId, getSupportersForSupporterTier, getSupportTierBySupportTierId, deleteSupportTier};