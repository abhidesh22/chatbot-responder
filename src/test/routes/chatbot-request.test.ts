import { chatbotRequestRouter } from '../../routes/chatbot-request';

it('Router Setup', () => {

    const routes = chatbotRequestRouter.stack
      .filter(layer => layer.route)
      .map(layer => layer.route.path)
  
    expect(routes.includes('/')).toBe(false)
    expect(routes.includes('/play-challenge')).toBe(true)
    expect(routes.includes('/challenge-history/:id')).toBe(true)
})