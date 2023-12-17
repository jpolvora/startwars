import amqp from 'amqplib'

export class RabbitMQAdapter {
  connection = null

  constructor(url) {
    this.url = url
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url)
    } catch (e) {
      console.error('Erro ao conectar no servidor AMQP: ' + e)
      throw e
    }
  }

  async disconnect() {
    await this.connection.close()
  }

  async consume(queueName, callback) {
    const channel = await this.connection.createChannel()
    await channel.assertQueue(queueName, { durable: true })
    await channel.prefetch(1)
    channel.consume(queueName, async (msg) => {
      const input = JSON.parse(msg.content.toString())
      await callback(input)
      await channel.ack(msg)
    })
  }

  async publish(queueName, data) {
    const channel = await this.connection.createChannel()
    await channel.assertQueue(queueName, { durable: true })
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
  }
}
