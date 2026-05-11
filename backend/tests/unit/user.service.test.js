const UserService = require('../../src/application/services/user.service');
const AppError = require('../../src/shared/utils/app-error');
const constants = require('../../src/shared/constants');

describe('UserService', () => {
  const userRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn()
  };

  const sucursalRepository = {
    findById: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createUser throws if email exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1' });

    const service = new UserService(userRepository, sucursalRepository);

    await expect(
      service.createUser({ email: 'test@example.com', password: '123456', rol: constants.ROLES.ADMIN })
    ).rejects.toBeInstanceOf(AppError);
  });

  test('createUser requires sucursal for operario', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const service = new UserService(userRepository, sucursalRepository);

    await expect(
      service.createUser({ email: 'test@example.com', password: '123456', rol: constants.ROLES.OPERARIO })
    ).rejects.toBeInstanceOf(AppError);
  });

  test('createUser hashes password and returns sanitized user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    sucursalRepository.findById.mockResolvedValue({ id: 's1' });
    userRepository.create.mockResolvedValue({ id: 'u1' });
    userRepository.findById.mockResolvedValue({ id: 'u1', email: 'test@example.com' });

    const service = new UserService(userRepository, sucursalRepository);

    const result = await service.createUser({
      email: 'test@example.com',
      password: '123456',
      rol: constants.ROLES.OPERARIO,
      sucursalId: 's1'
    });

    expect(userRepository.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'u1', email: 'test@example.com' });
  });

  test('updateUser validates sucursal when provided', async () => {
    sucursalRepository.findById.mockResolvedValue(null);

    const service = new UserService(userRepository, sucursalRepository);

    await expect(
      service.updateUser('u1', { sucursalId: 's1', rol: constants.ROLES.OPERARIO })
    ).rejects.toBeInstanceOf(AppError);
  });
});
