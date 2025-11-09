/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('project', (table) => {
    table.text('init_sql').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (_knex) {
  // without rollback script, can not revert text to jsonb in postgres
  // init sql should be string, not jsonb
};
