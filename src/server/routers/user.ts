import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { compare, hash } from 'bcryptjs';

// Zod schema for address
const addressSchema = z.object({
  label: z.string().min(1, 'Label alamat harus diisi'),
  recipientName: z.string().min(3, 'Nama penerima minimal 3 karakter'),
  phoneNumber: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor telepon hanya boleh angka'),
  fullAddress: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  district: z.string().min(3, 'Kecamatan harus diisi'),
  city: z.string().min(3, 'Kota harus diisi'),
  province: z.string().min(3, 'Provinsi harus diisi'),
  postalCode: z
    .string()
    .min(5, 'Kode pos harus 5 digit')
    .max(5, 'Kode pos harus 5 digit')
    .regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit angka'),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const userRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.id)
        .select('username email fullName phone role isActive')
        .lean();

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User tidak ditemukan',
        });
      }

      return {
        success: true,
        profile: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      console.error('[getProfile] Error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Gagal mengambil data profil',
        cause: error,
      });
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
        phone: z
          .string()
          .min(10, 'Nomor telepon minimal 10 digit')
          .max(15, 'Nomor telepon maksimal 15 digit')
          .regex(/^[0-9]+$/, 'Nomor telepon hanya boleh angka'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Update fields
        user.fullName = input.fullName;
        user.phone = input.phone;

        await user.save();

        return {
          success: true,
          message: 'Profil berhasil diperbarui',
          profile: {
            fullName: user.fullName,
            phone: user.phone,
          },
        };
      } catch (error) {
        console.error('[updateProfile] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal memperbarui profil',
          cause: error,
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1, 'Password lama harus diisi'),
        newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Verify old password
        const isPasswordValid = await compare(input.oldPassword, user.password);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password lama tidak sesuai',
          });
        }

        // Hash new password
        const hashedPassword = await hash(input.newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return {
          success: true,
          message: 'Password berhasil diubah',
        };
      } catch (error) {
        console.error('[changePassword] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengubah password',
          cause: error,
        });
      }
    }),

  // Get all addresses for current user
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    try {
      await connectDB();

      const user = await User.findById(ctx.user.id).select('addresses').lean();

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User tidak ditemukan',
        });
      }

      return {
        success: true,
        addresses: user.addresses || [],
      };
    } catch (error) {
      console.error('[getAddresses] Error:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Gagal mengambil data alamat',
        cause: error,
      });
    }
  }),

  // Add new address
  addAddress: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Generate unique address ID
        const addressId = `addr-${ctx.user.id}-${Date.now()}`;

        // If this is the first address, set as default
        const isDefault = user.addresses.length === 0;

        // Create new address object
        const newAddress = {
          id: addressId,
          label: input.label,
          recipientName: input.recipientName,
          phoneNumber: input.phoneNumber,
          fullAddress: input.fullAddress,
          district: input.district,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode,
          notes: input.notes || '',
          isDefault,
          latitude: input.latitude,
          longitude: input.longitude,
        };

        // Add address to user
        user.addresses.push(newAddress);
        await user.save();

        return {
          success: true,
          message: 'Alamat berhasil ditambahkan',
          address: newAddress,
        };
      } catch (error) {
        console.error('[addAddress] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal menambahkan alamat',
          cause: error,
        });
      }
    }),

  // Update address
  updateAddress: protectedProcedure
    .input(
      z.object({
        addressId: z.string(),
        data: addressSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Find address index
        const addressIndex = user.addresses.findIndex(
          (addr) => addr.id === input.addressId
        );

        if (addressIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Alamat tidak ditemukan',
          });
        }

        // Update address (preserve id and isDefault)
        const existingAddress = user.addresses[addressIndex];
        user.addresses[addressIndex] = {
          id: existingAddress.id, // Preserve id
          isDefault: existingAddress.isDefault, // Preserve isDefault
          ...input.data,
        };

        await user.save();

        return {
          success: true,
          message: 'Alamat berhasil diperbarui',
          address: user.addresses[addressIndex],
        };
      } catch (error) {
        console.error('[updateAddress] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal memperbarui alamat',
          cause: error,
        });
      }
    }),

  // Delete address
  deleteAddress: protectedProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Find address
        const addressToDelete = user.addresses.find(
          (addr) => addr.id === input.addressId
        );

        if (!addressToDelete) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Alamat tidak ditemukan',
          });
        }

        // Remove address
        user.addresses = user.addresses.filter(
          (addr) => addr.id !== input.addressId
        );

        // If deleted address was default and there are other addresses,
        // set the first one as default
        if (addressToDelete.isDefault && user.addresses.length > 0) {
          user.addresses[0].isDefault = true;
        }

        await user.save();

        return {
          success: true,
          message: 'Alamat berhasil dihapus',
        };
      } catch (error) {
        console.error('[deleteAddress] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal menghapus alamat',
          cause: error,
        });
      }
    }),

  // Set default address
  setDefaultAddress: protectedProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const user = await User.findById(ctx.user.id);

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User tidak ditemukan',
          });
        }

        // Find address
        const addressExists = user.addresses.find(
          (addr) => addr.id === input.addressId
        );

        if (!addressExists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Alamat tidak ditemukan',
          });
        }

        // Set all addresses to not default
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });

        // Set selected address as default
        const targetAddress = user.addresses.find(
          (addr) => addr.id === input.addressId
        );
        if (targetAddress) {
          targetAddress.isDefault = true;
        }

        await user.save();

        return {
          success: true,
          message: 'Alamat default berhasil diubah',
        };
      } catch (error) {
        console.error('[setDefaultAddress] Error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Gagal mengubah alamat default',
          cause: error,
        });
      }
    }),
});
