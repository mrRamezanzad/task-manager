import { randomUUID } from 'crypto';
import { User } from 'src/auth/entity/user.entity';

export function mockUser (rawUser: Partial<User> = {
  email: 'test@test.com', password: 'hashedpassword'
}): User {
  const user = new User();
  Object.assign(user, rawUser);
  user.id = randomUUID();
  
  return user;
}