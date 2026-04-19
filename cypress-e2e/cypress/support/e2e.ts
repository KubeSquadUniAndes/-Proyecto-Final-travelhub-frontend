Cypress.Commands.add('loginAsUser', (userType: 'traveler' | 'hotel' = 'traveler') => {
  const fakeProfile = {
    id: 'test-user-id',
    email: userType === 'hotel' ? 'hotel@test.com' : 'viajero@test.com',
    full_name: userType === 'hotel' ? 'Hotel Admin' : 'Test Viajero',
    status: 'active',
    is_superuser: false,
    role: userType,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  cy.window().then((win) => {
    win.localStorage.setItem('access_token', 'fake-token-for-e2e');
    win.localStorage.setItem('user_profile', JSON.stringify(fakeProfile));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsUser(userType?: 'traveler' | 'hotel'): Chainable<void>;
    }
  }
}
