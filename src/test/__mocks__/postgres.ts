const tx = Object.assign(jest.fn(), { begin: jest.fn() })

const sql = Object.assign(jest.fn(), {
  begin: jest.fn(async (cb: (tx: jest.Mock) => Promise<void>) => {
    return cb(tx)
  })
})

const postgres = Object.assign(jest.fn(() => sql), {
  __sql: sql,
  __tx: tx
})

export default postgres
