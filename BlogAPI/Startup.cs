using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Messaging;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Text;

namespace BlogAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "BlogAuth";
                options.DefaultChallengeScheme = "BlogAuth";
            }
            ).AddJwtBearer("BlogAuth", JwtBearerOptions =>
            {
                JwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration.GetValue<string>("JWTPrivateKey"))),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero
                };
            });

            services.AddAuthorization(authConfig =>
            {
                authConfig.AddPolicy("IsCommenter", policyBuilder =>
                {
                    policyBuilder.RequireClaim(ClaimTypes.Name);
                    policyBuilder.RequireClaim(ClaimTypes.Email);
                    string[] acceptedRoles = { UserModel.ADMIN_ROLE, UserModel.COMMENTER_ROLE };
                    policyBuilder.RequireRole(acceptedRoles);
                });
                authConfig.AddPolicy("IsAdmin", policyBuilder =>
                {
                    policyBuilder.RequireClaim(ClaimTypes.Name);
                    policyBuilder.RequireClaim(ClaimTypes.Email);
                    string[] acceptedRoles = { UserModel.ADMIN_ROLE };
                    policyBuilder.RequireRole(acceptedRoles);
                });
            });

            services.AddCors();
            services.AddControllers();
            services.AddSingleton<IBlogDbAccessor, SQLDapperDataAccessor>();
            services.AddSingleton<IEmailService, EmailService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors(policy =>
            {
                policy.AllowAnyHeader();
                policy.AllowAnyMethod();
                //policy.AllowAnyOrigin();
                policy.AllowCredentials();
            });

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
