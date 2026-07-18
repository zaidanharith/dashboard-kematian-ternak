const roleMiddleware = require('../../middlewares/role.middleware');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('roleMiddleware', () => {
  it('returns 403 when req.user is missing', () => {
    const req = {};
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is not in the allowed list', () => {
    const req = { user: { role: 'PETUGAS' } };
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user role is in the allowed list', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('ADMIN', 'PETUGAS')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 for an ADMIN-only route when the user is PETUGAS', () => {
    const req = { user: { role: 'PETUGAS' } };
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('ADMIN', 'SUPERADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for an ADMIN-only route when the user is SUPERADMIN', () => {
    const req = { user: { role: 'SUPERADMIN' } };
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('ADMIN', 'SUPERADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 for a SUPERADMIN-only route when the user is ADMIN', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = buildRes();
    const next = jest.fn();

    roleMiddleware('SUPERADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
