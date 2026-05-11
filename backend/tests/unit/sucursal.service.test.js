const SucursalService = require('../../src/application/services/sucursal.service');
const AppError = require('../../src/shared/utils/app-error');

describe('SucursalService', () => {
  const sucursalRepository = {
    findByCodigo: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createSucursal rejects duplicate code', async () => {
    sucursalRepository.findByCodigo.mockResolvedValue({ id: 's1' });

    const service = new SucursalService(sucursalRepository);

    await expect(
      service.createSucursal({ codigo: 'LIM-001' })
    ).rejects.toBeInstanceOf(AppError);
  });

  test('createSucursal creates new sucursal', async () => {
    sucursalRepository.findByCodigo.mockResolvedValue(null);
    sucursalRepository.create.mockResolvedValue({ id: 's1', codigo: 'LIM-001' });

    const service = new SucursalService(sucursalRepository);

    const result = await service.createSucursal({ codigo: 'LIM-001' });

    expect(result).toEqual({ id: 's1', codigo: 'LIM-001' });
  });

  test('activateSucursal updates estado', async () => {
    sucursalRepository.update.mockResolvedValue({ id: 's1', estado: true });

    const service = new SucursalService(sucursalRepository);

    const result = await service.activateSucursal('s1');

    expect(result).toEqual({ id: 's1', estado: true });
  });
});
