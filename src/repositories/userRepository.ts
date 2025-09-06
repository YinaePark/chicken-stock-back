import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { UserEntity } from '../entities/UserEntity';

export class UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async create(userData: {
    nickname: string;
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByNickname(nickname: string): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { nickname } });
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findWithPlayers(id: string): Promise<UserEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['players', 'players.game']
    });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async checkNicknameExists(nickname: string): Promise<boolean> {
    const count = await this.repository.count({ where: { nickname } });
    return count > 0;
  }
}