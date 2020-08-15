// 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  /**
   * running on port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * TODO: Database stuff
   */
  // database: {
  //   dbname: process.env.DB_NAME,
  //   user: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  // },

  /**
   * image mimes for security when uploading file
   */
  image_mimes: [
    'png', 'jpg', 'webp'
  ],

  /**
   * API configs
   */
  api: {
    prefix: '/'
  }
}
