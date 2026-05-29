import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { AuthMiddleware } from 'src/auth/middleware/auth.middleware';
import { OrganizationMiddleware } from './rbac/context/organization.middleware';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(OrganizationMiddleware)
      .exclude({ path: 'auth/signup', method: RequestMethod.POST })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
