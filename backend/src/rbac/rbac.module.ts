import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrganizationContext } from './context/organization.context';
import { OrganizationMiddleware } from './context/organization.middleware';
import { RbacGuard } from './guards/rbac.guard';
import { RbacService } from './rbac.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    OrganizationContext,
    OrganizationMiddleware,
    RbacGuard,
    PrismaService,
    RbacService,
  ],
  exports: [OrganizationContext, RbacGuard, RbacService],
})
export class RbacModule {}
