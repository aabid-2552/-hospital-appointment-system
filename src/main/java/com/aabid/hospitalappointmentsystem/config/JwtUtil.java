package com.aabid.hospitalappointmentsystem.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private  final long expirationTime=1000*60*60*10;

    public  String generateToken(String email){
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() +expirationTime))
                .signWith(secretKey)
                .compact();
    }
    public  String  extractEmail(String token){
        return  extractClaim(token, Claims::getSubject);
    }
    public Boolean isTokenValid(String token){
        try {
            return !isTokenExpired(token);

        }catch (Exception e){
            return false;
        }
    }
    public boolean isTokenExpired(String token){
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        Claims claims=Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}
