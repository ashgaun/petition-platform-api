import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const getAll = async (where: string, sort: string): Promise<Petition[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT
                        p.id AS petitionId,
                        p.title,
                        p.category_id AS categoryId,
                        p.owner_id AS ownerId,
                        u.first_name AS ownerFirstName,
                        u.last_name AS ownerLastName,
                        COUNT(s.user_id) AS numberOfSupporters,
                        p.creation_date AS creationDate,
                        COALESCE(MIN(st.cost), 0) AS supportingCost
                    FROM
                        petition p
                        JOIN user u ON p.owner_id = u.id
                        LEFT JOIN support_tier st ON p.id = st.petition_id
                        LEFT JOIN supporter s ON st.id = s.support_tier_id
                    ${where}
                    GROUP BY
                        p.id
                    ORDER BY
                        ${sort === '' ? 'p.creation_date ASC, p.id ASC' : sort + ', p.id ASC'}`;
    const [result] = await conn.query(query);
    await conn.release();
    return result;

}
const getPetitionsById = async (id: number): Promise<Petition[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT
                        p.id AS petitionId,
                        p.title,
                        p.description,
                        p.category_id AS categoryId,
                        p.owner_id AS ownerId,
                        u.first_name AS ownerFirstName,
                        u.last_name AS ownerLastName,
                        COUNT(s.user_id) AS numberOfSupporters,
                        p.creation_date AS creationDate,
                        COALESCE(MIN(st.cost), 0) AS supportingCost
                    FROM
                        petition p
                        JOIN user u ON p.owner_id = u.id
                        LEFT JOIN support_tier st ON p.id = st.petition_id
                        LEFT JOIN supporter s ON st.id = s.support_tier_id
                    WHERE p.id = ?
                    GROUP BY
                        p.id`;
    const [rows] = await conn.query(query, [id]);
    await conn.release();
    return rows;
}
const postpetition = async (title: string, description: string,categoryId: number,ownerId:number,date:Date): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `INSERT INTO petition (title, description, category_id, owner_id, creation_date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await conn.query(query, [title,description, categoryId, ownerId, new Date()]);
    await conn.release();
    return result;
}
const postsupportertier = async (title: string, description: string,cost: number,petitionId:number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `INSERT INTO support_tier (title, description, cost, petition_id) VALUES (?, ?, ?, ?)`;
    const [result] = await conn.query(query, [title,description, cost, petitionId]);
    await conn.release();
    return result;
}

const getsupportertiers = async (petitionId: number): Promise<[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM support_tier WHERE petition_id = ?`;
    const [result] = await conn.query(query, [petitionId]);
    await conn.release();
    return result;
}
const getAllCategories = async (): Promise<Category[]> => {
    const conn = await getPool().getConnection();
    const query = `SELECT * FROM category`;
    const [result] = await conn.query(query);
    await conn.release();
    return result;
}
const patchpetitions = async (title: string, description: string,categoryId: number,id:number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `UPDATE petition SET title = ?, description = ?, category_id = ? WHERE id = ?`;
    const [result] = await conn.query(query, [title,description, categoryId, id]);
    await conn.release();
    return result;
}
const deletepetition = async (id: number): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    const query = `DELETE FROM petition WHERE id = ?`;
    const [result] = await conn.query(query, [id]);
    await conn.release();
    return result;
}

export { getAll, getPetitionsById,getAllCategories, postpetition, postsupportertier, patchpetitions,deletepetition,getsupportertiers}