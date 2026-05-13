const asyncHandler = require('../../shared/utils/async-handler');

class DniController {
  constructor(reniecService) {
    this.reniecService = reniecService;
  }

  lookup = asyncHandler(async (req, res) => {
    const { dni } = req.params;
    const data = await this.reniecService.obtenerInfoPersona(dni);

    res.status(200).json({
      success: true,
      data
    });
  });
}

module.exports = DniController;
