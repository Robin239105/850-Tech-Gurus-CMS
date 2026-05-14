import { sql as vercelSql } from '@vercel/postgres';

export const sql = async function (strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  const result = await vercelSql(strings, ...values);
  return result.rows;
};

