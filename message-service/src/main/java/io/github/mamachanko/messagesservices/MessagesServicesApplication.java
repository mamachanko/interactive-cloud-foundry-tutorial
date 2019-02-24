package io.github.mamachanko.messagesservices;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@SpringBootApplication
public class MessagesServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessagesServicesApplication.class, args);
    }

}

@RestController
@Slf4j
class MessagesController {

    private MessageRepository messageRepository;
    private IdProvider idProvider;
    private int pageSize;

    public MessagesController(MessageRepository messageRepository, IdProvider idProvider, @Qualifier("pageSize") int pageSize) {
        this.messageRepository = messageRepository;
        this.idProvider = idProvider;
        this.pageSize = pageSize;
    }

    @GetMapping("/api/messages")
    List<Message> getMessages() {
        PageRequest tenMostRecentMessages = PageRequest.of(0, pageSize, Sort.by("timestamp").descending());
        return messageRepository.findAll(tenMostRecentMessages)
                .get()
                .collect(toList());
    }

    @PostMapping("/api/messages")
    ResponseEntity<Message> saveMessage(@RequestBody Message message) {
        message.setId(idProvider.getNextId());
        messageRepository.save(message);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }
}

@Configuration
class Config {

    @Bean
    int pageSize () {
        return 10;
    }
}

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
class Message {
    @Id
    private String id;
    private String text;
    private Long timestamp;
}

@Repository
interface MessageRepository extends PagingAndSortingRepository<Message, String> {

    @Override
    List<Message> findAll();
}

@Component
class IdProvider {

    public String getNextId() {
        return UUID.randomUUID().toString();
    }
}

@Configuration
@Profile("!cloud")
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}