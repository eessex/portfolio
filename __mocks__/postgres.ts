const tx: jest.Mock = jest.fn()

const sql = Object.assign(jest.fn(), {
  begin: jest.fn(async (cb: (tx: jest.Mock) => Promise<void>) => {
    await cb(tx)
  })
})

const postgres = Object.assign(jest.fn(() => sql), {
  __sql: sql,
  __tx: tx
})

export default postgres
