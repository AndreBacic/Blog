using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

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
            services.AddAuthentication(options => {
                options.DefaultAuthenticateScheme = "BlogAuth";
                options.DefaultChallengeScheme = "BlogAuth";
            }
            ).AddJwtBearer("BlogAuth", JwtBearerOptions =>
            {
                JwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = somehowgetthatsecretkeyfromthesecureplace,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(3)
                };
            });

            services.AddAuthorization(authConfig =>
            {
                authConfig.AddPolicy("Ensure Commenter Policy", policyBuilder =>
                {
                    policyBuilder.RequireClaim(ClaimTypes.Name);
                });
            });

            services.AddCors();
            services.AddControllers();
            services.AddSingleton<IBlogDbAccessor, SQLDapperDataAccessor>();
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
